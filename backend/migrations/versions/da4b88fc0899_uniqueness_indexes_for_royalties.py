"""Uniqueness indexes for royalties

Revision ID: da4b88fc0899
Revises: 6f64d0e4f895
Create Date: 2023-02-16 21:24:15.997547

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'da4b88fc0899'
down_revision = '6f64d0e4f895'
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint('uq_dividend_history_year_quarter_offering', 'dividend_history', ['year', 'quarter', 'offering_id'])
    op.create_unique_constraint('uq_dividend_region_offering_id', 'dividend_region', ['offering_id'])
    pass


def downgrade():
    pass
