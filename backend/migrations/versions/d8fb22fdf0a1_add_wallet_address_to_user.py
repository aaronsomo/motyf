"""Add wallet address to user

Revision ID: d8fb22fdf0a1
Revises: 6047de3c7f8d
Create Date: 2022-11-30 16:56:25.371897

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd8fb22fdf0a1'
down_revision = '6047de3c7f8d'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user', sa.Column('external_wallet', sa.String(), nullable=True))
    pass


def downgrade():
    op.drop_column('user', 'external_wallet')
    pass
