"""Adding offerings table

Revision ID: e243c03e469e
Revises: d8fb22fdf0a1
Create Date: 2022-12-09 19:32:54.888489

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e243c03e469e'
down_revision = 'd8fb22fdf0a1'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'offering',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('contract_address', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    pass


def downgrade():
    op.drop_table('offering')
    pass
