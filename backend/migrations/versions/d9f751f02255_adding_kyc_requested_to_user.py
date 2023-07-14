"""Adding KYC requested to User

Revision ID: d9f751f02255
Revises: 6f4713b23513
Create Date: 2022-11-01 17:53:13.233612

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd9f751f02255'
down_revision = '6f4713b23513'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user', sa.Column('kyc_requested', sa.Boolean(), server_default='0', nullable=False))
    pass


def downgrade():
    op.drop_column('user', 'kyc_requested')
    pass
