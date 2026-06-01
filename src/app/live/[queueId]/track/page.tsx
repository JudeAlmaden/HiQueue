import { getQueueById } from "@/server/repositories/queue.repo"
import { notFound } from "next/navigation"
import { TrackTicketClient } from "./TrackTicketClient"

interface Props {
  params: Promise<{ queueId: string }>
}

export default async function TrackTicketPage({ params }: Props) {
  const { queueId } = await params
  const queue = await getQueueById(queueId)

  if (!queue) {
    notFound()
  }

  return (
    <TrackTicketClient
      queueId={queue.id}
      queueName={queue.name}
      organizationName={queue.organization.name}
    />
  )
}
