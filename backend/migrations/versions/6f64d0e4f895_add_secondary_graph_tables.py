"""Add secondary graph tables

Revision ID: 6f64d0e4f895
Revises: d0b266c706a7
Create Date: 2023-02-15 19:24:31.288700

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6f64d0e4f895'
down_revision = 'd0b266c706a7'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'song_dividend',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('offering_id', sa.Integer(), nullable=False),
        sa.Column('song', sa.String(), nullable=False),
        sa.Column('amount', sa.Numeric(10,2), nullable=False),
    )
    op.create_table(
        'dividend_region',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('offering_id', sa.Integer(), nullable=False),
        sa.Column('domestic', sa.Numeric(10,2), nullable=False),
        sa.Column('international', sa.Numeric(10,2), nullable=False),
    )
    pass


def downgrade():
    op.drop_table('song_dividend')
    op.drop_table('dividend_region')
    pass
