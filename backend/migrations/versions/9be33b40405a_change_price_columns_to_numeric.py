"""Change price columns to numeric

Revision ID: 9be33b40405a
Revises: ff97f000c8cd
Create Date: 2023-02-08 16:17:30.073698

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9be33b40405a'
down_revision = 'ff97f000c8cd'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('secondary_listing', 'price', existing_type=sa.Integer(), type_=sa.Numeric(10,2))
    op.alter_column('secondary_sale', 'price', existing_type=sa.Integer(), type_=sa.Numeric(10,2))
    pass


def downgrade():
    pass
