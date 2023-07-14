"""Fix secondary offer numeric type

Revision ID: ded7d73dfd8d
Revises: ad1adead37a4
Create Date: 2023-03-07 19:02:06.839289

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ded7d73dfd8d'
down_revision = 'ad1adead37a4'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('secondary_offer', 'price', existing_type=sa.Integer(), type_=sa.Numeric(10,2))
    pass


def downgrade():
    op.alter_column('secondary_offer', 'price', existing_type=sa.Numeric(10,2), type_=sa.Integer())
    pass
