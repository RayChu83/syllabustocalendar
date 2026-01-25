import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import AddSemesterForm from "./_components/AddSemesterForm";

export default function AddSemester() {
  return (
    <>
      <main className="mt-17 flex flex-col gap-10 max-w-240 mx-auto py-8 px-6">
        <AddSemesterForm />
      </main>
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(24, 24, 27)"
        gradientBackgroundEnd="rgb(30, 33, 37)"
        firstColor="40, 43, 47"
        secondColor="43, 40, 47"
        thirdColor="47, 40, 43"
        fourthColor="43, 47, 40"
        fifthColor="40, 43, 47"
        pointerColor="100, 100, 100"
        size="100%"
        blendingValue="soft-light"
      />
    </>
  );
}
