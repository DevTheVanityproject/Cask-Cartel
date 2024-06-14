export async function getCheckoutProfileId(graphql) {
    const response = await graphql(
        `
        query checkoutProfiles {
            checkoutProfiles(first: 10) {
                edges {
                    node {
                        id
                        name
                        isPublished
                    }
                }
            }
        }
        `
    );
    return response.json();
}

export async function setStyling(graphql, id) {
    const response = await graphql(
        `mutation ChangeColorScheme1($checkoutBrandingInput: CheckoutBrandingInput!, $checkoutProfileId: ID!) {
            checkoutBrandingUpsert(checkoutBrandingInput: $checkoutBrandingInput, checkoutProfileId: $checkoutProfileId) {
                checkoutBranding {
                    designSystem {
                        colors {
                            schemes {
                                scheme1 {
                                    primaryButton{
                                        background
                                        hover {
                                            background
                                        }
                                    }
                                }
                                scheme2 {
                                    primaryButton {
                                        background
                                        hover {
                                            background
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
        `,
        {
            variables: {
                "checkoutProfileId": id,
                "checkoutBrandingInput": {
                    "designSystem": {
                        "colors": {
                            "schemes": {
                                "scheme1": {
                                    "primaryButton": {
                                        "background": "#dd5329",
                                        "hover": {
                                            "background": "#b6411d"
                                        }
                                    }
                                },
                                "scheme2": {
                                    "primaryButton": {
                                        "background": "#dd5329",
                                        "hover": {
                                            "background": "#b6411d"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    );
    return response.json();
}


export async function changeOrderSummaryScheme(graphql, id) {
    const response = await graphql(
      `mutation ChangeOrderSummaryScheme($checkoutBrandingInput: CheckoutBrandingInput!, $checkoutProfileId: ID!) {
        checkoutBrandingUpsert(checkoutBrandingInput: $checkoutBrandingInput, checkoutProfileId: $checkoutProfileId) {
          checkoutBranding {
            customizations {
                primaryButton {
                    inlinePadding
                }
                secondaryButton {
                    cornerRadius   
                }
                main{
                    section{
                        padding
                        borderWidth
                    }  
                }
                orderSummary{
                    section{
                    padding   
                    }
                }
                header {
                alignment
                padding 
             }
             headingLevel1{
                typography{
                weight
                size
                }
             },
             headingLevel2{
                typography{
                weight
                size 
                }
             }
             headingLevel3{
                typography{
                weight
                size 
                }
             }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
      `,{
        variables: {
          "checkoutProfileId": id,
          "checkoutBrandingInput": {
            "customizations": {
                "primaryButton": {
                    "cornerRadius": "LARGE",
                },
                "secondaryButton": {
                    "cornerRadius": "LARGE",
                },
                "main":{
                    "section":{
                       "padding":"SMALL_500",
                    }
                   },
                   "orderSummary":{
                       "section":{
                          "padding":"SMALL_500"
                       }
                      },

              "header":{
                "alignment": "START",
                "padding":"BASE"
              },
              "headingLevel1":{
                "typography":{
                    "weight":"BASE",
                    "size" : "LARGE"

                }
              },
              "headingLevel2":{
                "typography":{
                    "weight":"BASE",
                    "size" : "LARGE"

                }
              },
              "headingLevel3":{
                "typography":{
                    "weight":"BASE",
                    "size" : "LARGE"
                    
                }
              }
            }
          }
        } 
      }
    );
    return response.json();
  }
