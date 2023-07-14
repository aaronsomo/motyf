"""Add royalty table

Revision ID: fb9019663c80
Revises: 9eb8456b903a
Create Date: 2023-02-13 21:37:56.834059

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fb9019663c80'
down_revision = '9eb8456b903a'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'dividend_history',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('offering_id', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('quarter', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
    )
    pass


def downgrade():
    op.drop_table('dividend_history')
    pass
