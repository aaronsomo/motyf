import React, { useCallback, useState } from 'react';
import { SuitabilityFields, PartyRequiredFields, PartyOptionalFields, AccountOptionalFields, AccountRequiredFields } from 'types';
import { upsertParty, getParty, getAccount, upsertAccount, upsertSuitability, getSuitability } from 'api/kyc';

const defaultPartyRequiredFields: PartyRequiredFields = {
  domicile: 'U.S. Resident',
  firstName: '',
  lastName: '',
  dob: '',
  primCountry: 'United States',
  primAddress1: '',
  primCity: '',
  primState: 'AL',
  primZip: '',
  emailAddress: '',
};

const defaultAccountRequiredFields: AccountRequiredFields = {
  streetAddress1: '',
  city: '',
  state: 'AL',
  zip: '',
  country: 'United States',
};

const PARTY_REQUIRED_FIELDS = Object.keys(defaultPartyRequiredFields);
const ACCOUNT_REQUIRED_FIELDS = Object.keys(defaultAccountRequiredFields);

interface Props {
  children: React.ReactNode;
}

interface TransactContextProps {
  partyRequiredFields: PartyRequiredFields;
  partyOptionalFields: PartyOptionalFields;
  setPartyRequiredFields: (p: PartyRequiredFields) => void;
  setPartyOptionalFields: (p: PartyOptionalFields) => void;
  refreshParty: () => Promise<void>;
  writeParty: () => Promise<void>;
  accountRequiredFields: AccountRequiredFields;
  accountOptionalFields: AccountOptionalFields;
  setAccountRequiredFields: (p: AccountRequiredFields) => void;
  setAccountOptionalFields: (p: AccountOptionalFields) => void;
  refreshAccount: () => Promise<void>;
  writeAccount: () => Promise<void>;
  suitabilityFields: SuitabilityFields
  setSuitabilityFields: (p: SuitabilityFields) => void;
  refreshSuitability: () => Promise<void>;
  writeSuitability: () => Promise<void>;
}

const TransactContext = React.createContext<TransactContextProps>({
  partyRequiredFields: defaultPartyRequiredFields,
  partyOptionalFields: {},
  setPartyRequiredFields: () => {},
  setPartyOptionalFields: () => {},
  refreshParty: async () => {},
  writeParty: async () => {},
  accountRequiredFields: defaultAccountRequiredFields,
  accountOptionalFields: {},
  setAccountRequiredFields: () => {},
  setAccountOptionalFields: () => {},
  refreshAccount: async () => {},
  writeAccount: async () => {},
  suitabilityFields: {},
  setSuitabilityFields: () => {},
  refreshSuitability: async () => {},
  writeSuitability: async () => {},
});

const TransactContextProvider: React.FC<Props> = ({ children }: Props) => {
  const [partyRequiredFields, setPartyRequiredFields] = useState<PartyRequiredFields>(defaultPartyRequiredFields);
  const [partyOptionalFields, setPartyOptionalFields] = useState<PartyOptionalFields>({});
  const [accountRequiredFields, setAccountRequiredFields] = useState<AccountRequiredFields>(defaultAccountRequiredFields);
  const [accountOptionalFields, setAccountOptionalFields] = useState<AccountOptionalFields>({});
  const [suitabilityFields, setSuitabilityFields] = useState<SuitabilityFields>({});

  const pick = (obj: any, ...keys: any) => Object.fromEntries(
    keys
    .filter((key: any) => key in obj)
    .map((key: any) => [key, obj[key]])
  );

  const omit = (obj: any, ...keys: any) => Object.fromEntries(
    Object.entries(obj)
    .filter(([key]) => !keys.includes(key))
  );

  const refreshParty = useCallback(async () => {
    try {
      const { party } = await getParty();
      setPartyRequiredFields(pick(party, ...PARTY_REQUIRED_FIELDS) as PartyRequiredFields);
      setPartyOptionalFields(omit(party, ...PARTY_REQUIRED_FIELDS) as PartyOptionalFields);
    } catch (e) {
      setPartyRequiredFields(defaultPartyRequiredFields);
      setPartyOptionalFields({});
    }
  }, []);

  const writeParty = useCallback(async () => {
    await upsertParty({
      ...partyRequiredFields, ...partyOptionalFields,
    });
  }, [partyRequiredFields, partyOptionalFields]);

  const refreshAccount = useCallback(async () => {
    try {
      const { account } = await getAccount();
      setAccountRequiredFields(pick(account, ...ACCOUNT_REQUIRED_FIELDS) as AccountRequiredFields);
      setAccountOptionalFields(omit(account, ...ACCOUNT_REQUIRED_FIELDS) as AccountOptionalFields);
    } catch (e) {
      setAccountRequiredFields(defaultAccountRequiredFields);
      setAccountOptionalFields({});
    }
  }, []);

  const writeAccount = useCallback(async () => {
    await upsertAccount({
      ...accountRequiredFields, ...accountOptionalFields,
    });
  }, [accountRequiredFields, accountOptionalFields]);

  const refreshSuitability = useCallback(async () => {
    try {
      const { suitability } = await getSuitability();
      setSuitabilityFields(suitability);
    } catch (e) {
      setSuitabilityFields({});
    }
  }, []);

  const writeSuitability = useCallback(async () => {
    await upsertSuitability(suitabilityFields);
  }, [suitabilityFields]);

  return (
    <TransactContext.Provider
      value={{
        partyRequiredFields,
        partyOptionalFields,
        setPartyRequiredFields,
        setPartyOptionalFields,
        refreshParty,
        writeParty,
        accountRequiredFields,
        accountOptionalFields,
        setAccountOptionalFields,
        setAccountRequiredFields,
        refreshAccount,
        writeAccount,
        suitabilityFields,
        setSuitabilityFields,
        refreshSuitability,
        writeSuitability
      }}
    >
      {children}
    </TransactContext.Provider>
  );
};

export { TransactContext, TransactContextProvider };
