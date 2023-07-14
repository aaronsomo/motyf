"""Add dwolla id to user

Revision ID: ff97f000c8cd
Revises: 3eed4093ee73
Create Date: 2023-02-01 18:32:59.689686

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ff97f000c8cd'
down_revision = '3eed4093ee73'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user', sa.Column('dwolla_id', sa.String(), nullable=True))
    pass


def downgrade():
    op.drop_column('user', 'dwolla_id')
    pass
