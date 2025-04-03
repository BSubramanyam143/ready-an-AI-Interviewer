import Agent from  "@/components/agent"
import { getCurrentUser } from "@/components/lib/actions/auth.action"

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
 <h3 className="text-xl italic">
   click " Call " AI will ask some questions to prepare your interview.
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