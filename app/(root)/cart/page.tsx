"use client";

import useCart from "@/lib/hooks/useCart";

import { useUser } from "@clerk/nextjs";
import { MinusCircle, PlusCircle, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Cart = () => {
  const router = useRouter();
  const { user } = useUser();
  const cart = useCart();

  const total = cart.cartItems.reduce(
    (acc, cartItem) => acc + cartItem.item.price * cartItem.quantity,
    0
  );
  const totalRounded = parseFloat(total.toFixed(2));

  const customer = {
    clerkId: user?.id,
    email: user?.emailAddresses[0].emailAddress,
    name: user?.fullName,
  };

  const handleCheckout = async () => {
    try {
      if (!user) {
        router.push("sign-in");
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
          method: "POST",
          body: JSON.stringify({ cartItems: cart.cartItems, customer }),
        });
        const data = await res.json();
        window.location.href = data.url;
      }
    } catch (err) {
      console.log("[checkout_POST]", err);
    }
  };

  return (
    <div className="flex gap-20 py-16 px-10 max-lg:flex-col max-sm:px-3">
      <div className="w-2/3 max-lg:w-full">
        <p className="text-heading3-bold">Carrinho de compras</p>
        <hr className="my-6" />

        {cart.cartItems.length === 0 ? (
          <p className="text-body-bold">Nenhum item no carrinho.</p>
        ) : (
          <div>
            {cart.cartItems.map((cartItem, i) => (
              <div key={i} className="w-full flex max-sm:flex-col max-sm:gap-3 hover:bg-grey-1 px-4 py-3 items-center max-sm:items-start justify-between">
                <div className="w-2/3 flex justify-between items-center">
                  <div className="flex items-center">
                    <Image
                      src={cartItem.item.media[0]}
                      width={100}
                      height={100}
                      className="rounded-lg w-32 h-32 object-cover"
                      alt="product"
                    />
                    <div className="flex flex-col gap-3 ml-4">
                      <Link href={`/products/${cartItem.item._id}`} className="text-body-bold">{cartItem.item.title}</Link>
                      {cartItem.color && (
                        <p className="text-small-medium">{cartItem.color}</p>
                      )}
                      {cartItem.size && (
                        <p className="text-small-medium">{cartItem.size}</p>
                      )}
                      <p className="text-small-medium">${cartItem.item.price}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <MinusCircle
                      className={`${cartItem.quantity === 1 ? "text-grey-2 !cursor-not-allowed" : "hover:text-blue-1 cursor-pointer"}`}
                      onClick={() => cartItem.quantity === 1 ? null : cart.decreaseQuantity(cartItem.item._id, cartItem.color || '', cartItem.size || '')}
                    />
                    <p className="text-body-bold">{cartItem.quantity}</p>
                    <PlusCircle
                      className="hover:text-blue-1 cursor-pointer"
                      onClick={() => cart.increaseQuantity(cartItem.item._id, cartItem.color || '', cartItem.size || '')}
                    />
                  </div>
                </div>
                <Trash
                  className="hover:text-blue-1 cursor-pointer"
                  onClick={() => cart.removeItem(cartItem.item._id, cartItem.color || '', cartItem.size || '')}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-1/3 max-lg:w-full flex flex-col justify-between gap-8 bg-grey-1 rounded-lg px-4 py-5">
        <div>
          <p className="text-heading4-bold pb-4">
            Resumo da compra{" "}
            <span>{`(${cart.cartItems.length} ${cart.cartItems.length > 1 ? "itens" : "item"
              })`}</span>
          </p>
          <div className="flex justify-between text-body-semibold">
            <span>Total</span>
            <span>€ {totalRounded.toFixed(2)}</span>
          </div>
        </div>
        <button
          className="border rounded-lg text-body-bold bg-white py-3 w-full hover:bg-black hover:text-white cursor-pointer"
          onClick={handleCheckout}
        >
          Proceder ao pagamento
        </button>
      </div>
    </div>
  );
};

export default Cart;
