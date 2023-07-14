"""add user_token_likes table

Revision ID: 3eed4093ee73
Revises: 4fa6e96039c9
Create Date: 2023-01-26 17:37:30.727282

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3eed4093ee73'
down_revision = '4fa6e96039c9'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user_token_like',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('offering_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token_id', sa.Integer(), nullable=False),
    )
    op.create_index(op.f('ix_user_token_like_token'), 'user_token_like', ['token_id'], unique=False)
    op.create_index(op.f('ix_user_token_like_user'), 'user_token_like', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_token_like_offering'), 'user_token_like', ['offering_id'], unique=False)
    op.create_unique_constraint('uq_user_token_like', 'user_token_like', ['offering_id', 'user_id', 'token_id'])
    pass


def downgrade():
    op.drop_table('user_token_like')
    pass
