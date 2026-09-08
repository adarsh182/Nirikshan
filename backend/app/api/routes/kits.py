from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_operator
from app.database.connection import get_db
from app.models.kit_type import KitType
from app.models.operator import Operator
from app.schemas import KitTypeOut

router = APIRouter(prefix="/kits", tags=["kits"])


@router.get("", response_model=list[KitTypeOut])
def list_kits(
    db: Annotated[Session, Depends(get_db)],
    _operator: Annotated[Operator, Depends(get_current_operator)],
) -> list[KitType]:
    return db.query(KitType).order_by(KitType.name).all()
