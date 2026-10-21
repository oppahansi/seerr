import type { Language, Region } from '@server/lib/settings';
import { sortBy } from 'lodash';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import Select from 'react-select';
import useSWR from 'swr';

type OptionType = {
  value: string;
  label: string;
};

interface ContentFilterSelectorProps {
  type: 'language' | 'country';
  value?: string;
  fieldName: string;
  setFieldValue: (property: string, value: string) => void;
  isDisabled?: boolean;
}

const ContentFilterSelector = ({
  type,
  value,
  fieldName,
  setFieldValue,
  isDisabled,
}: ContentFilterSelectorProps) => {
  const intl = useIntl();
  const { data: languages } = useSWR<Language[]>(
    type === 'language' ? '/api/v1/languages' : null
  );
  const { data: regions } = useSWR<Region[]>(
    type === 'country' ? '/api/v1/regions' : null
  );

  const options: OptionType[] = useMemo(() => {
    const mapped =
      type === 'language'
        ? (languages ?? []).map((language) => ({
            value: language.iso_639_1,
            label: `${
              intl.formatDisplayName(language.iso_639_1, {
                type: 'language',
                fallback: 'none',
              }) ?? language.english_name
            } (${language.iso_639_1})`,
          }))
        : (regions ?? []).map((region) => ({
            value: region.iso_3166_1,
            label: `${
              intl.formatDisplayName(region.iso_3166_1, {
                type: 'region',
                fallback: 'none',
              }) ?? region.english_name
            } (${region.iso_3166_1})`,
          }));

    return sortBy(mapped, 'label');
  }, [intl, type, languages, regions]);

  const selectedCodes = (value ?? '').split('|').filter(Boolean);

  return (
    <Select<OptionType, true>
      options={options}
      isMulti
      isDisabled={isDisabled}
      className="react-select-container"
      classNamePrefix="react-select"
      value={selectedCodes.map(
        (code) =>
          options.find((option) => option.value === code) ?? {
            value: code,
            label: code,
          }
      )}
      onChange={(selected) =>
        setFieldValue(
          fieldName,
          selected.map((option) => option.value).join('|')
        )
      }
    />
  );
};

export default ContentFilterSelector;
