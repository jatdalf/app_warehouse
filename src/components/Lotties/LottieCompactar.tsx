import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LottieDataAnalisis = () => {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "500px",
          maxWidth: "90%",
          backgroundColor: "white",
          border: "1px solid #ddd",
        }}
      >
        <DotLottieReact src= "/lotties/Compactar.lottie" autoplay loop/>
      </div>
    </div>
  );
};

export default LottieDataAnalisis;