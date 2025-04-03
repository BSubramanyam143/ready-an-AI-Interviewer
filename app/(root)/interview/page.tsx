import Agent from  "@/components/agent"
import { getCurrentUser } from "@/components/lib/actions/auth.action"

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
 <h3 className="text-xl italic">
  Please provide the required tech stacks and other relevant details to generate interview questions.
</h3>



      <Agent
        userName={user?.name!}
        userId={user?.id}
       type="generate"
      />
    </>
  );
};

export default Page;