"""Change royalty to currency

Revision ID: d0b266c706a7
Revises: fb9019663c80
Create Date: 2023-02-15 17:22:22.726742

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd0b266c706a7'
down_revision = 'fb9019663c80'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('dividend_history', 'amount', existing_type=sa.Integer(), type_=sa.Numeric(10,2))
    pass


def downgrade():
    op.alter_column('dividend_history', 'amount', existing_type=sa.Numeric(10,2), type_=sa.Integer())
    pass
