import { redirect } from "next/navigation";

type TaskDetailsPageProps = {
  params: {
    id: string;
  };
};

export default function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  void params;
  redirect("/tasks");
}
