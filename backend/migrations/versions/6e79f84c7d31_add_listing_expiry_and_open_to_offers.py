"""Add listing expiry and open to offers

Revision ID: 6e79f84c7d31
Revises: 58c86851aea0
Create Date: 2023-03-03 16:24:03.894206

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6e79f84c7d31'
down_revision = '58c86851aea0'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('secondary_listing', sa.Column('open_to_offers', sa.Boolean(), nullable=False, server_default='0'))
    op.add_column('secondary_listing', sa.Column('listing_expiry', sa.Date(), nullable=True))
    pass


def downgrade():
    op.drop_column('secondary_listing', 'open_to_offers')
    op.drop_column('secondary_listing', 'listing_expiry')
    pass
