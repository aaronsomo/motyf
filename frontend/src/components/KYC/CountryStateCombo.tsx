import React from 'react';
import { US_STATE_CODES } from '../../constants';
import { SelectInputGroup } from 'components/KYC/SelectInputGroup';

interface Props<Type> {
  countryLabel: string;
  stateLabel: string;
  fields: Type;
  setFields: (fields: Type) => void;
  countryKey: keyof Type;
  stateKey: keyof Type;
  required: boolean;
};

export function CountryStateCombo<Type extends { [k: string]: string | undefined }>({
  countryLabel,
  stateLabel,
  fields,
  setFields,
  countryKey,
  stateKey,
  required,
  }: Props<Type>) {

  const setCountry = (pfields: Type) => {
    if (pfields[countryKey] !== 'United States') {
      setFields({...pfields, [stateKey]: ''});
    } else if (pfields[countryKey] === 'United States') {
      setFields({...pfields, [stateKey]: 'AL'});
    }
  };

  return (
    <>
      <SelectInputGroup required={required} label={countryLabel} propertyKey={countryKey} fields={fields} setFields={setCountry} options={['United States']}/>
      <SelectInputGroup required={required} label={stateLabel} propertyKey={stateKey} fields={fields} setFields={setFields} options={US_STATE_CODES}/>
    </>
  );
};
