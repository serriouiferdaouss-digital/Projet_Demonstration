import datetime
from typing import Optional, List

import strawberry
from strawberry.types import Info

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models
from app.security import hash_password, verify_password
from app.jwt_utils import create_access_token, decode_token



def get_token_payload(info: Info) -> dict:
    request = info.context["request"]
    auth = request.headers.get("authorization")

    if not auth or not auth.lower().startswith("bearer "):
        raise Exception("Unauthorized")

    token = auth.split(" ", 1)[1].strip()
    return decode_token(token)  


def get_current_user_id(info: Info) -> int:
    payload = get_token_payload(info)
    user_id = payload.get("user_id")
    if not user_id:
        raise Exception("Unauthorized")
    return int(user_id)


def get_current_role(info: Info) -> str:
    payload = get_token_payload(info)
    role = payload.get("role")
    if not role:
        raise Exception("Unauthorized")
    return str(role)


def ensure_admin(info: Info) -> None:
    role = get_current_role(info)
    if role != "ADMIN":
        raise Exception("Forbidden")


def to_role_str(role_obj) -> str:
    return role_obj.value if hasattr(role_obj, "value") else str(role_obj)



@strawberry.type
class UserType:
    id: int
    username: str
    role: str


@strawberry.type
class AuthPayload:
    token: str
    user: UserType


@strawberry.type
class ProductType:
    id: int
    name: str
    description: Optional[str]
    price: float
    quantity: int
    created_at: datetime.datetime
    updated_at: datetime.datetime


@strawberry.input
class ProductInput:
    name: str
    description: Optional[str] = None
    price: float = 0
    quantity: int = 0


@strawberry.type
class ProductPayload:
    product: ProductType



@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello GraphQL"

    @strawberry.field
    def me(self, info: Info) -> UserType:
        user_id = get_current_user_id(info)

        db: Session = SessionLocal()
        try:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if not user:
                raise Exception("Unauthorized")

            role_str = to_role_str(user.role)
            return UserType(id=user.id, username=user.username, role=role_str)
        finally:
            db.close()

   
    @strawberry.field
    def products(self, info: Info) -> List[ProductType]:
        _ = get_current_user_id(info)  

        db: Session = SessionLocal()
        try:
            items = db.query(models.Product).order_by(desc(models.Product.created_at)).all()
            return [
                ProductType(
                    id=p.id,
                    name=p.name,
                    description=p.description,
                    price=float(p.price),
                    quantity=p.quantity,
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                )
                for p in items
            ]
        finally:
            db.close()

   
    @strawberry.field(name="productById")
    def product_by_id(self, info: Info, id: int) -> ProductType:
        _ = get_current_user_id(info)

        db: Session = SessionLocal()
        try:
            p = db.query(models.Product).filter(models.Product.id == id).first()
            if not p:
                raise Exception("Product not found")

            return ProductType(
                id=p.id,
                name=p.name,
                description=p.description,
                price=float(p.price),
                quantity=p.quantity,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
        finally:
            db.close()



@strawberry.type
class Mutation:
    
    @strawberry.mutation
    def register(self, username: str, email: str, password: str ,role :str) -> AuthPayload:
        if not username:
            raise Exception("username required")
        if not email:
            raise Exception("email required")
        if not password or len(password) < 6:
            raise Exception("password required (min 6)")
        if role not in ["USER", "ADMIN"]:
            raise Exception("role must be USER or ADMIN")

        db: Session = SessionLocal()
        try:
            if db.query(models.User).filter(models.User.username == username).first():
                raise Exception("Username already exists")

            if db.query(models.User).filter(models.User.email == email).first():
                raise Exception("Email already exists")

            hashed_password = hash_password(password)

            user = models.User(
                username=username,
                email=email,
                password_hash=hashed_password,
                role=role,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            role_str = to_role_str(user.role)

            token = create_access_token({
                "user_id": user.id,
                "username": user.username,
                "role": role_str,
            })

            return AuthPayload(
                token=token,
                user=UserType(id=user.id, username=user.username, role=role_str),
            )
        finally:
            db.close()

    
    @strawberry.mutation
    def login(self, username: str, password: str) -> AuthPayload:
        db: Session = SessionLocal()
        try:
            user = db.query(models.User).filter(models.User.username == username).first()
            if not user or not verify_password(password, user.password_hash):
                raise Exception("Invalid credentials")

            role_str = to_role_str(user.role)

            token = create_access_token({
                "user_id": user.id,
                "username": user.username,
                "role": role_str,
            })

            return AuthPayload(
                token=token,
                user=UserType(id=user.id, username=user.username, role=role_str),
            )
        finally:
            db.close()

    
    @strawberry.mutation(name="createProduct")
    def create_product(self, info: Info, input: ProductInput) -> ProductPayload:
        _ = get_current_user_id(info)

      
        if not input.name or len(input.name.strip()) < 2:
            raise Exception("Validation error: name")
        if input.price < 0:
            raise Exception("Validation error: price")
        if input.quantity < 0:
            raise Exception("Validation error: quantity")

        db: Session = SessionLocal()
        try:
            p = models.Product(
                name=input.name.strip(),
                description=input.description,
                price=input.price,
                quantity=input.quantity,
            )
            db.add(p)
            db.commit()
            db.refresh(p)

            return ProductPayload(
                product=ProductType(
                    id=p.id,
                    name=p.name,
                    description=p.description,
                    price=float(p.price),
                    quantity=p.quantity,
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                )
            )
        finally:
            db.close()

    
    @strawberry.mutation(name="updateProduct")
    def update_product(self, info: Info, id: int, input: ProductInput) -> ProductPayload:
        _ = get_current_user_id(info)

        if not input.name or len(input.name.strip()) < 2:
            raise Exception("Validation error: name")
        if input.price < 0:
            raise Exception("Validation error: price")
        if input.quantity < 0:
            raise Exception("Validation error: quantity")

        db: Session = SessionLocal()
        try:
            p = db.query(models.Product).filter(models.Product.id == id).first()
            if not p:
                raise Exception("Product not found")

            p.name = input.name.strip()
            p.description = input.description
            p.price = input.price
            p.quantity = input.quantity

            db.commit()
            db.refresh(p)

            return ProductPayload(
                product=ProductType(
                    id=p.id,
                    name=p.name,
                    description=p.description,
                    price=float(p.price),
                    quantity=p.quantity,
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                )
            )
        finally:
            db.close()

    
    @strawberry.mutation(name="deleteProduct")
    def delete_product(self, info: Info, id: int) -> bool:
        _ = get_current_user_id(info)
        ensure_admin(info)

        db: Session = SessionLocal()
        try:
            p = db.query(models.Product).filter(models.Product.id == id).first()
            if not p:
                raise Exception("Product not found")

            db.delete(p)
            db.commit()
            return True 
        finally:
            db.close()


schema = strawberry.Schema(query=Query, mutation=Mutation)
