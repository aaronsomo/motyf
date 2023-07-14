"""Add manual_kyc_id to user

Revision ID: 4cd9671a22bc
Revises: 988ea564f0e1
Create Date: 2022-11-03 16:58:43.469686

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4cd9671a22bc'
down_revision = '988ea564f0e1'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user', sa.Column('manual_kyc_id', sa.String(), nullable=True))
    pass


def downgrade():
    op.drop_column('user', 'manual_kyc_id')
    pass
