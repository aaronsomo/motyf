"""Adding notifications table to db

Revision ID: 875df2e591aa
Revises: 27f215717cfd
Create Date: 2023-03-31 20:11:42.117430

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '875df2e591aa'
down_revision = '27f215717cfd'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'notification',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, default=False),
        sa.Column('message', sa.String(length=255), nullable=False),
        sa.Column('redirect', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    pass


def downgrade():
    op.drop_table('notification')
    pass
