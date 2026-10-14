
import os
import psycopg

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict
from psycopg.types.json import Jsonb

load_dotenv()

app = FastAPI(
    title="ResolvePath AI API",
    description="Decision-support API for the ResolvePath MVP",
    version="1.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class DecisionRequest(BaseModel):
    email: str = Field(default="", max_length=254)
    decision_question: str = Field(min_length=3, max_length=500)
    option_a: str = Field(min_length=1, max_length=200)
    option_b: str = Field(min_length=1, max_length=200)
    ratings_a: Dict[str, int]
    ratings_b: Dict[str, int]


def get_db_connection():
    required = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"]
    missing = [key for key in required if not os.getenv(key)]

    if missing:
        raise RuntimeError(
            "Missing database configuration: " + ", ".join(missing)
        )

    return psycopg.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "postgres"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        sslmode="require",
        connect_timeout=10,
    )


@app.get("/")
def home():
    return {"app": "ResolvePath AI", "status": "running"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "ResolvePath AI API"}



@app.post("/api/analyze")
def analyze_decision(data: DecisionRequest):
    print("TEST: analyze_decision endpoint reached", flush=True)
    if not data.ratings_a:
        raise HTTPException(400, "Select at least one priority.")


    if set(data.ratings_a) != set(data.ratings_b):
        raise HTTPException(
            400, "Both options must be rated for the same priorities."
        )

    for ratings in (data.ratings_a, data.ratings_b):
        if any(
            not isinstance(v, int) or isinstance(v, bool) or v < 1 or v > 5
            for v in ratings.values()
        ):
            raise HTTPException(
                400, "Ratings must be integers from 1 to 5."
            )

    score_a = sum(data.ratings_a.values())
    score_b = sum(data.ratings_b.values())
    max_score = len(data.ratings_a) * 5

    if score_a > score_b:
        winner = data.option_a
    elif score_b > score_a:
        winner = data.option_b
    else:
        winner = "Both options are equally rated"

    comparison = [
        {
            "priority": key,
            "option_a": data.ratings_a[key],
            "option_b": data.ratings_b[key],
        }
        for key in data.ratings_a
    ]

    # Save the successful analysis to Supabase PostgreSQL.
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO public.decision_sessions (
                        email,
                        decision_question,
                        option_a,
                        option_b,
                        ratings_a,
                        ratings_b,
                        score_a,
                        score_b,
                        winner
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        data.email or None,
                        data.decision_question,
                        data.option_a,
                        data.option_b,
                        Jsonb(data.ratings_a),
                        Jsonb(data.ratings_b),
                        score_a,
                        score_b,
                        winner,
                    ),
                )
                session_id = cur.fetchone()[0]

    
    
    
    except Exception as e:
        print(f"Database save failed: {e!r}", flush=True)
        raise HTTPException(
            status_code=503,
            detail="Analysis could not be saved. Please try again later."
        )




    return {
        "session_id": session_id,
        "decision_question": data.decision_question,
        "option_a": data.option_a,
        "option_b": data.option_b,
        "score_a": score_a,
        "score_b": score_b,
        "maximum_score": max_score,
        "percentage_a": round(score_a / max_score * 100),
        "percentage_b": round(score_b / max_score * 100),
        "winner": winner,
        "priority_comparison": comparison,
        "disclaimer": (
            "Scores reflect the ratings entered by the user. "
            "They are not predictions or guarantees of outcomes."
        ),
    }
