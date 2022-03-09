import React, {FC} from "react";

interface CountryFlagProps {
  code: string;
  width?: string;
}

const CountryFlag: FC<CountryFlagProps> = ({ code, width = "30" }) => {
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      width={width}
      alt={`${code} flag`}
    />
  );
};

export default CountryFlag;