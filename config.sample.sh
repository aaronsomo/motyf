# echo "ERROR: PLEASE ENTER CREDENTIALS IN config.sh, THEN COMMENT OUT THIS LINE" && exit 1;

# we use semicolons at the end of each line because sometimes people check out the codebase using CRLF line endings - in bash, the CR gets treated as a character and causes many issues on Windows, even with WSL

# application settings and secrets
export FLASK_SECRET_KEY='0aa921aded847207de3abe968fcafbae';
export API_URL_PREFIX='/api';
export FRONTEND_URL_PREFIX='http://localhost:5000';
export ENABLE_USER_REGISTRATION=1;
export ENVIRONMENT='test'

export DATABASE_URL='postgresql://motyf:dev_db_password@db/motyf'

export NORCAP_API_KEY=''
export NORCAP_CLIENT_ID=''
export NORCAP_API_PREFIX='https://api-sandboxdash.norcapsecurities.com/tapiv3/index.php/v3/'
export NORCAP_UI_PREFIX='https://api-sandboxdash.norcapsecurities.com/admin_v3/client/'
export MOTYF_ISSUER_ID='990824'
export MOTYF_MEMBER_ID='A74375'
export LATEST_OFFERING_ID='1331933'

export QUICKNODE_HTTP_URL="<->"
export DEPLOYER_PRIVATE_KEY="0000000000000000000000000000000000000000000000000000000000000000"
export POLYGONSCAN_KEY="your-key"
export MAIN_CONTRACT_ABI='[]'

export DWOLLA_SECRET=''
export DWOLLA_KEY=''
export DWOLLA_MASTER_FUNDING_ACCOUNT=''