import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="flex flex-col justify-center max-w-7xl gap-12">
        <div className="flex flex-col gap-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Superb Sider</h1>
          <p className="leading-7">An intentional mispelling of the game, giiker super slider</p>
        </div>
      </div>
    </main>
  );
}
