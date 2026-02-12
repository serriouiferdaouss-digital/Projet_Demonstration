from fastapi import FastAPI, Request
from strawberry.fastapi import GraphQLRouter

from app.db import test_db_connection
from app.graphql_schema import schema

app = FastAPI(title="Demo API")

@app.get("/health")
def health():
    return {"status": "UP"}

@app.on_event("startup")
def startup_event():
    test_db_connection()


async def get_context(request: Request):
    return {"request": request}

graphql_app = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_app, prefix="/graphql")
