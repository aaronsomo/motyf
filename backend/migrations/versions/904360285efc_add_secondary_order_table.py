"""Add secondary order table

Revision ID: 904360285efc
Revises: 8bdaab8864f1
Create Date: 2023-01-05 17:02:30.389362

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '904360285efc'
down_revision = '7aa503a66ab3'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'secondary_order',
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('security_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('order_id')
    )
    pass


def downgrade():
    op.drop_table('secondary_order')
    pass
