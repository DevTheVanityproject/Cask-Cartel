import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useEffect, useState, useRef } from "preact/hooks";
import {
  useCartLines,
  useApplyCartLinesChange,
  useApi,
  useStorage,
} from "@shopify/ui-extensions/checkout/preact";

/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   images: { nodes: { url: string }[] };
 *   variants: { nodes: { id: string; price: { amount: string } }[] };
 * }} Product
 */

export default async () => {
  render(<App />, document.body);
};

function App() {
  const { query, i18n } = useApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  const lines = useCartLines();
  const storage = useStorage();
  const [product, setProduct] = useState(/** @type {Product | null} */ (null));
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [minutes, setMinutes] = useState("03");
  const [seconds, setSeconds] = useState("00");
  const [timerExpired, setTimerExpired] = useState(false);
  const Ref = useRef(/** @type {ReturnType<typeof setInterval> | null} */ (null));
  
  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    const lineInCart = lines.some(
      (line) =>
        line.merchandise.product.id === "gid://shopify/Product/4372932001930"
    );
    setIsInCart(lineInCart);
    if (lineInCart) {
      setShowContent(false);
    }
  }, [lines]);

  useEffect(() => {
    async function initializeTimer() {
      const storedEndTime = /** @type {string | null} */ (await storage.read("timerEndTime"));
      if (storedEndTime) {
        const endTime = new Date(storedEndTime);
        const currentTime = new Date();
        
        // Calculate the difference in minutes
        const diffMinutes = (endTime.getTime() - currentTime.getTime()) / (1000 * 60);
        
        if (diffMinutes <= -10) {
          // If the difference is 1 minute or more, delete the storage and reset the timer
          await storage.delete("timerEndTime");
          const newEndTime = getDeadTime();
          startTimer(newEndTime);
        } else {
          // Otherwise, start or resume the timer
          startTimer(endTime);
        }
      } else {
        // If no stored end time, set a new timer
        const newEndTime = getDeadTime();
        startTimer(newEndTime);
      }
    }
    initializeTimer();
  }, []);

  /** @param {Date} endTime */
  const getTimeRemaining = (endTime) => {
    const total = Date.parse(String(endTime)) - Date.parse(String(new Date()));
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return { total, minutes, seconds };
  };

  /** @param {Date} endTime */
  const startTimer = (endTime) => {
    let { total, minutes, seconds } = getTimeRemaining(endTime);
    if (total >= 0) {
      setMinutes(minutes > 9 ? String(minutes) : "0" + minutes);
      setSeconds(seconds > 9 ? String(seconds) : "0" + seconds);
    } else {
      setShowContent(false); // Hide content when timer ends
      setTimerExpired(true); // Set timer expired to true
    }

    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      let { total, minutes, seconds } = getTimeRemaining(endTime);
      if (total >= 0) {
        setMinutes(minutes > 9 ? String(minutes) : "0" + minutes);
        setSeconds(seconds > 9 ? String(seconds) : "0" + seconds);
      } else {
        setShowContent(false);
        setTimerExpired(true);
        clearInterval(id);
      }
    }, 1000);
    Ref.current = id;
  };

  const getDeadTime = () => {
    let deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 180); // 3 minutes
    storage.write("timerEndTime", deadline.toISOString());
    return deadline;
  };

  /** @param {string} variantId */
  async function handleAddToCart(variantId) {
    setAdding(true);
    try {
      const lineItemCheck = lines.find(
        (line) =>
          line.merchandise.product.id === "gid://shopify/Product/4372932001930"
      );
      if (lineItemCheck) {
        setShowContent(false);
      } else {
        if (!isInCart) {
          const result = await applyCartLinesChange({
            type: "addCartLine",
            merchandiseId: variantId,
            quantity: 1,
          });
          if (result.type === "error") {
            setShowError(true);
            console.error(result.message);
          } else {
            setIsInCart(true);
            setShowContent(false);
          }
        }
      }
    } catch (error) {
      console.error(error);
      setShowError(true);
    } finally {
      setAdding(false);
    }
  }

  async function fetchProduct() {
    setLoading(true);
    try {
      /** @type {{ data?: { product: Product } }} */
      const { data } = await query(
        `query ($id: ID!) {
          product(id: $id) {
            id
            title
            images(first: 1) {
              nodes {
                url
              }
            }
            variants(first: 1) {
              nodes {
                id
                price {
                  amount
                }
              }
            }
          }
        }`,
        {
          variables: { id: "gid://shopify/Product/4372932001930" },
        }
      );
      setProduct(data?.product ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const lineItem = lines.filter((line) =>
    line.merchandise.product.id.includes("gid://shopify/Product/4372932001930")
  );
  if (lineItem.length === 0) {
    if (timerExpired) {
      return (
        <s-stack gap="large" alignItems="center">
          <s-heading>
            <s-text type="strong" tone="critical">
              PROMOTION EXPIRED
            </s-text>
          </s-heading>
        </s-stack>
      );
    }
  }

  if (!showContent) {
    return null; // Render nothing when time is up or product is in the cart
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!product) {
    return null;
  }

  const productVariantId = product.variants.nodes[0].id;

  return (
    <>
      <s-stack background="subdued" gap="large" overflow="visible">
        <s-grid
          gridTemplateColumns="auto"
          borderRadius="large"
          background="base"
          justifyItems="center"
        >
          <s-image src="https://cdn.shopify.com/s/files/1/0682/3139/7624/files/freebie-banner_900x_23aeb9a7-5d72-4526-a52b-1e797926f82e.webp?v=1716961503" />
        </s-grid>
      </s-stack>
      <s-stack
        background="subdued"
        padding="base large-200 none large-200"
        gap="base"
        overflow="hidden"
      >
        <s-grid
          gridTemplateColumns="auto"
          borderRadius="large"
          padding="large"
          background="base"
          gap="base"
          justifyItems="center"
        >
          <s-stack alignItems="center">
            <s-heading>
            When you complete your purchase within:
            </s-heading>
          </s-stack>

          <s-stack alignItems="center">
            <s-heading>
              <s-text type="strong">
                {minutes}:{seconds}
              </s-text>
            </s-heading>
          </s-stack>
        </s-grid>
      </s-stack>
      <s-stack background="subdued" padding="small-200" gap="large">
        <ProductOffer
          product={product}
          i18n={i18n}
          adding={adding}
          handleAddToCart={handleAddToCart}
          showError={showError}
          isInCart={isInCart}
          productVariantId={productVariantId}
        />
      </s-stack>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <s-stack gap="large">
      <s-heading>You might also like</s-heading>
      <s-stack gap="large">
        <s-grid
          gap="base"
          gridTemplateColumns="64px 1fr auto"
          alignItems="center"
        >
          <s-skeleton-paragraph />
        </s-grid>
      </s-stack>
    </s-stack>
  );
}


/**
 * @param {{
 *   product: Product;
 *   i18n: { formatCurrency: (amount: number) => string };
 *   adding: boolean;
 *   handleAddToCart: (variantId: string) => void;
 *   showError: boolean;
 *   isInCart: boolean;
 *   productVariantId: string;
 * }} props
 */
function ProductOffer({
  product,
  i18n,
  adding,
  handleAddToCart,
  showError,
  isInCart,
  productVariantId,
}) {
  const { images, title, variants } = product;
  const renderPrice = i18n.formatCurrency(Number(variants.nodes[0].price.amount));
  const imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  return (
    <s-stack>
      <s-stack alignItems="center">
        <s-heading>
          <s-text type="strong">FREE MINI BOTTLES!</s-text>
        </s-heading>
      </s-stack>
      <s-stack gap="large-200" minBlockSize="100%">
        <s-grid
          background="base"
          padding="large"
          borderRadius="large"
          border="base"
          gap="base"
          gridTemplateColumns="85px 1fr auto"
          alignItems="center"
        >
          <s-image
            src={imageUrl}
            alt={title}
            aspectRatio="1"
          />
          <s-stack gap="none" alignItems="center">
            <s-text type="strong">
              BONUS GIFT
            </s-text>
            {/* <s-text color="subdued">{renderPrice}</s-text> */}
          </s-stack>
          <s-button
            loading={adding}
            onClick={() => handleAddToCart(productVariantId)}
          >
            {isInCart ? "In Cart" : "+ Add Gift"}
          </s-button>
        </s-grid>
      </s-stack>
      {showError && <ErrorBanner />}
    </s-stack>
  );
}

function ErrorBanner() {
  return (
    <s-banner tone="critical">
      There was an issue adding this product. Please try again.
    </s-banner>
  );
}
