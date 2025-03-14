/* eslint-disable @typescript-eslint/no-explicit-any */
import { stripe } from "@/src/lib/stripe";
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from "@/src/styles/pages/products";
import axios from "axios";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Stripe from "stripe";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string
  };
}

export default function Product({ product }: ProductProps) {
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)
    const { isFallback } = useRouter();

    if (isFallback) {
      return <h1>Carregando...</h1>;
    }

    
    async function handleBuyProduct(){
        //const router = useRouter()

        try{
            setIsCreatingCheckout(true)
            const response = await axios.post('/api/checkout', {
                priceId: product.defaultPriceId
            })


            const { checkoutUrl } = response.data;

            //router.push(checkoutUrl)


            window.location.href = checkoutUrl;
        }catch{
            alert('Falha ao redirecionar')
        }
    }


  return (
    <ProductContainer>
      <ImageContainer>
        <Image src={product.imageUrl} width={520} height={480} alt="" />
      </ImageContainer>

      <ProductDetails>
        <h1>{product.name}</h1>
        <span>{product.price}</span>

        <p>{product.description}</p>

        <button disabled={isCreatingCheckout} onClick={handleBuyProduct}>Comprar</button>
      </ProductDetails>
    </ProductContainer>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};
export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  const productId = params!.id;
  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"],
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(price.unit_amount! / 100),
        description: product.description,
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1, // 1 hours
  };
};
