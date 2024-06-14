import React, { useEffect, useState, useRef } from "react";
import {
  Grid,
  reactExtension,
  Image,
  Banner,
  Heading,
  InlineLayout,
  BlockStack,
  Text,
  Button,
  useCartLines,
  useApplyCartLinesChange,
  useApi,
  SkeletonImage,
  useStorage,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => <App />);

function App() {
  const { query, i18n } = useApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  const lines = useCartLines();
  const storage = useStorage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [minutes, setMinutes] = useState("03");
  const [seconds, setSeconds] = useState("00");
  const [timerExpired, setTimerExpired] = useState(false);
  const Ref = useRef(null);
  
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
      const storedEndTime = await storage.read("timerEndTime");
      if (storedEndTime) {
        const endTime = new Date(storedEndTime);
        const currentTime = new Date();
        
        // Calculate the difference in minutes
        const diffMinutes = (endTime - currentTime) / (1000 * 60);
        
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

  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return { total, minutes, seconds };
  };

  const startTimer = (endTime) => {
    let { total, minutes, seconds } = getTimeRemaining(endTime);
    if (total >= 0) {
      setMinutes(minutes > 9 ? minutes : "0" + minutes);
      setSeconds(seconds > 9 ? seconds : "0" + seconds);
    } else {
      setShowContent(false); // Hide content when timer ends
      setTimerExpired(true); // Set timer expired to true
    }

    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      let { total, minutes, seconds } = getTimeRemaining(endTime);
      if (total >= 0) {
        setMinutes(minutes > 9 ? minutes : "0" + minutes);
        setSeconds(seconds > 9 ? seconds : "0" + seconds);
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
      setProduct(data.product);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const lineItem = lines.filter((line) =>
    line.merchandise.product.id.includes("gid://shopify/Product/4372932001930")
  );
  if (lineItem == false) {
    if (timerExpired) {
      return (
        <BlockStack spacing="loose" inlineAlignment={"center"}>
          <Text emphasis="bold" appearance="critical" size="extraLarge">
            PROMOTION EXPIRED
          </Text>
        </BlockStack>
      );
    }
  }

  if (!showContent) {
    return null; // Render nothing when time is up or product is in the cart
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!loading && !product) {
    return null;
  }

  const productVariantId = product.variants.nodes[0].id;

  return (
    <>
      <BlockStack background="subdued" spacing="loose" overflow="visible" >
        <Grid
          rows={["auto"]}
          borderRadius="loose"
          background="base"
          inlineAlignment="center"
          columns={["auto"]}
        >
          <Image source="https://cdn.shopify.com/s/files/1/0682/3139/7624/files/freebie-banner_900x_23aeb9a7-5d72-4526-a52b-1e797926f82e.webp?v=1716961503" />
        </Grid>
      </BlockStack>
      <BlockStack
        background={"subdued"}
        padding={['base', 'extraLoose', 'none', 'extraLoose']}
        spacing="base"
        overflow="hidden"
      >
        <Grid
          rows={["auto"]}
          borderRadius="loose"
          padding="loose"
          background="base"
          spacing="base"
          inlineAlignment="center"
          columns={["auto"]}
        >
          <BlockStack inlineAlignment={"center"}>
            <Text size="extraLarge" >
            When you complete your purchase within:
            </Text>
          </BlockStack>

          <BlockStack inlineAlignment={"center"}>
            <Text size="extraLarge" emphasis="bold">
              {minutes}:{seconds}
            </Text>
          </BlockStack>
        </Grid>
      </BlockStack>
      <BlockStack background="subdued" padding="tight" spacing="loose">
        <ProductOffer
          product={product}
          i18n={i18n}
          adding={adding}
          handleAddToCart={handleAddToCart}
          showError={showError}
          isInCart={isInCart}
          productVariantId={productVariantId}
        />
      </BlockStack>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <BlockStack spacing="loose">
      <Heading level={2}>You might also like</Heading>
      <BlockStack spacing="loose">
        <InlineLayout
          spacing="base"
          columns={[64, "fill", "auto"]}
          blockAlignment="center"
        >
          <SkeletonImage />
        </InlineLayout>
      </BlockStack>
    </BlockStack>
  );
}


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
  const renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);
  const imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  return (
    <BlockStack>
      <BlockStack inlineAlignment={"center"}>
        <Text size="extraLarge" emphasis="bold">
          FREE MINI BOTTLES!
        </Text>
      </BlockStack>
      <BlockStack spacing="extraLoose" minBlockSize={"fill"}>
        <InlineLayout
          background={"base"}
          padding={"loose"}
          borderRadius={"loose"}
          borderWidth="base"
          border={"base"}
          spacing="base"
          columns={[85, "fill", "auto"]}
          blockAlignment="center"
        >
          <Image
            source={imageUrl}
            description={title}
            aspectRatio={1}
          />
          <BlockStack spacing="none" inlineAlignment={"center"} >
            <Text size="large" emphasis="bold" >
              BONUS GIFT
            </Text>
            {/* <Text appearance="subdued">{renderPrice}</Text> */}
          </BlockStack>
          <Button
            loading={adding}
            onPress={() => handleAddToCart(productVariantId)}
          >
            {isInCart ? "In Cart" : "+ Add Gift"}
          </Button>
        </InlineLayout>
      </BlockStack>
      {showError && <ErrorBanner />}
    </BlockStack>
  );
}

function ErrorBanner() {
  return (
    <Banner status="critical">
      There was an issue adding this product. Please try again.
    </Banner>
  );
}
