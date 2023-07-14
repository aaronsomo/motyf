"""Add account id to user

Revision ID: 988ea564f0e1
Revises: d9f751f02255
Create Date: 2022-11-02 20:47:43.700376

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '988ea564f0e1'
down_revision = 'd9f751f02255'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user', sa.Column('account_id', sa.String(), nullable=True))
    pass


def downgrade():
    op.drop_column('user', 'account_id')
    pass
