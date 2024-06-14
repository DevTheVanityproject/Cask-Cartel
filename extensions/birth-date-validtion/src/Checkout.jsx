import {
  reactExtension,
  TextField,
  useApplyAttributeChange,
  useBuyerJourneyIntercept,
  useShippingAddress,
  Text,
  BlockStack
} from '@shopify/ui-extensions-react/checkout';
import { useState } from 'react';

export default reactExtension('purchase.checkout.block.render', () => <Extension />);

function Extension() {
  const [selectedDate, setSelectedDate] = useState('');
  const [validationError, setValidationError] = useState('');
  const applyAttributeChange = useApplyAttributeChange();
  const { countryCode } = useShippingAddress();
  const ageLimit = countryCode === 'US' ? 21 : 18;

  useBuyerJourneyIntercept(intercept);

  function intercept({ canBlockProgress }) {
    if (canBlockProgress) {
      const isOldEnough = checkAge(selectedDate);

      if (!isOldEnough) {
        return {
          behavior: 'allow',
          reason: 'Age restriction not met.',
          errors: [
            {
              message: countryCode === 'US'
                ? "You're not legally old enough to buy some of the items in your cart."
                : "You must be at least 18 years old.",
            },
          ],
        };
      }
    }

    return {
      behavior: 'allow',
      perform: () => {
        clearValidationErrors();
      },
    };
  }

  const handleDateChange = (newDate) => {
    if (isValidDateFormat(newDate)) {
      setSelectedDate(newDate);
      const isOldEnough = checkAge(newDate);

      if (isOldEnough) {
        setValidationError('');
        applyAttributeChange({
          type: 'updateAttribute',
          key: 'Birth Date',
          value: newDate,
        });
      } else {
        setValidationError(countryCode === 'US'
          ? 'You must be strictly older than 21 years.'
          : 'You must be strictly older than 18 years.');
      }
    } else {
      setValidationError('Date must be in the format YYYY-MM-DD.');
    }
  };

  function isValidDateFormat(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
  }

  function checkAge(date) {
    const currentDate = new Date();
    const selectedDateObj = new Date(date);

    const ageDiff = currentDate.getFullYear() - selectedDateObj.getFullYear();
    const monthDiff = currentDate.getMonth() - selectedDateObj.getMonth();
    const dayDiff = currentDate.getDate() - selectedDateObj.getDate();

    const isOldEnough = (ageDiff > ageLimit) || 
                        (ageDiff === ageLimit && monthDiff > 0) || 
                        (ageDiff === ageLimit && monthDiff === 0 && dayDiff > 0);

    return isOldEnough;
  }

  function clearValidationErrors() {
    setValidationError('');
  }

  return (
<>
      <BlockStack>
      <TextField
        label="Birth Date [YYYY-MM-DD]"
        value={selectedDate}
        onChange={(value) => handleDateChange(value)}
        error={validationError}
      />
      </BlockStack>
    <BlockStack padding={'tight'}>
       <Text> Enter your date of birth to confirm you are over the legal age of <Text emphasis='bold'>{ageLimit}</Text> to purchase alcohol in your location.</Text>
    </BlockStack>
</>
  );
}
