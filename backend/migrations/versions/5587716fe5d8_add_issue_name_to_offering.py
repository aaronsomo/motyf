"""Add issue name to offering

Revision ID: 5587716fe5d8
Revises: 43ebea20b85b
Create Date: 2023-01-23 21:37:59.937989

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5587716fe5d8'
down_revision = '43ebea20b85b'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('offering', sa.Column('issue_name', sa.String(), nullable=True))
    pass


def downgrade():
    op.drop_column('offering', 'issue_name');
    pass
