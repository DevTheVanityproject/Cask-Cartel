import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import {
  useBuyerJourneyIntercept,
  useShippingAddress,
} from '@shopify/ui-extensions/checkout/preact';

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const [selectedDate, setSelectedDate] = useState('');
  const [validationError, setValidationError] = useState('');
  const { countryCode } = useShippingAddress() ?? {};
  const ageLimit = countryCode === 'US' ? 21 : 18;

  useBuyerJourneyIntercept(intercept);

  // Kept as before: the age-check result returns `allow` (with a reason/errors), so the
  // object does not match the strict `InterceptorRequest` union; typed loosely on purpose.
  /**
   * @param {{ canBlockProgress: boolean }} options
   * @returns {any}
   */
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

  /** @param {string} newDate */
  const handleDateChange = (newDate) => {
    if (isValidDateFormat(newDate)) {
      setSelectedDate(newDate);
      const isOldEnough = checkAge(newDate);

      if (isOldEnough) {
        setValidationError('');
        shopify.applyAttributeChange({
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

  /** @param {string} date */
  function isValidDateFormat(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
  }

  /** @param {string} date */
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
      <s-stack>
      <s-text-field
        label="Birth Date [YYYY-MM-DD]"
        value={selectedDate}
        onChange={(event) => handleDateChange(/** @type {HTMLInputElement} */ (event.currentTarget).value)}
        error={validationError}
      />
      </s-stack>
    <s-stack padding="small-200">
       <s-text> Enter your date of birth to confirm you are over the legal age of <s-text type="strong">{ageLimit}</s-text> to purchase alcohol in your location.</s-text>
    </s-stack>
</>
  );
}
