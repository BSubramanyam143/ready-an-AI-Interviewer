import Agent from  "@/components/agent"
import { getCurrentUser } from "@/components/lib/actions/auth.action"

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
 <h3 className="text-xl italic">
  Please make a call and provide the necessary details about what you need to prepare today.
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