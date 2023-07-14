"""Adding uploaded count to party requests

Revision ID: ae5e643f9d88
Revises: 2b99baf5696e
Create Date: 2022-11-07 19:57:10.276846

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ae5e643f9d88'
down_revision = '2b99baf5696e'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('party', sa.Column('kyc_request_uploads', sa.Integer(), server_default='0', nullable=True))
    pass


def downgrade():
    op.drop_column('party', 'kyc_request_uploads')
    pass
