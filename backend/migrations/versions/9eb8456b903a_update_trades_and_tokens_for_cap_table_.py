"""Update trades and tokens for cap table tracking

Revision ID: 9eb8456b903a
Revises: 9be33b40405a
Create Date: 2023-02-13 18:32:44.788155

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9eb8456b903a'
down_revision = '9be33b40405a'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('token', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('token', sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('trade', sa.Column('user_id', sa.Integer()))
    pass


def downgrade():
    pass
