import os
from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session

from database import get_db
import models
from auth_utils import create_access_token

router = APIRouter(prefix="/auth", tags=["oauth"])

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

oauth = OAuth()

oauth.register(
    name="google",
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

oauth.register(
    name="github",
    client_id=os.environ.get("GITHUB_CLIENT_ID"),
    client_secret=os.environ.get("GITHUB_CLIENT_SECRET"),
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",
    client_kwargs={"scope": "read:user user:email"},
)


def get_or_create_oauth_user(db: Session, email: str, name: str, provider: str, oauth_id: str) -> models.User:
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        return user
    user = models.User(email=email, name=name, oauth_provider=provider, oauth_id=oauth_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    userinfo = token.get("userinfo")
    user = get_or_create_oauth_user(
        db, email=userinfo["email"], name=userinfo.get("name"),
        provider="google", oauth_id=userinfo["sub"],
    )
    jwt_token = create_access_token({"sub": str(user.id)})
    return RedirectResponse(f"{FRONTEND_URL}/oauth-success?token={jwt_token}")


@router.get("/github/login")
async def github_login(request: Request):
    redirect_uri = request.url_for("github_callback")
    return await oauth.github.authorize_redirect(request, redirect_uri)


@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.github.authorize_access_token(request)
    resp = await oauth.github.get("user", token=token)
    profile = resp.json()

    email = profile.get("email")
    if not email:
        emails_resp = await oauth.github.get("user/emails", token=token)
        emails = emails_resp.json()
        primary = next((e for e in emails if e.get("primary")), emails[0] if emails else None)
        email = primary["email"] if primary else f"{profile['id']}@users.noreply.github.com"

    user = get_or_create_oauth_user(
        db, email=email, name=profile.get("name") or profile.get("login"),
        provider="github", oauth_id=str(profile["id"]),
    )
    jwt_token = create_access_token({"sub": str(user.id)})
    return RedirectResponse(f"{FRONTEND_URL}/oauth-success?token={jwt_token}")