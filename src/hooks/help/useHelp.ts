import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  helpService,
  SubmitQueryRequest,
  ReplyQueryRequest,
  HelpQuery,
} from "@/services/help/helpService";

export const useSubmitQuery = () => {
  const queryClient = useQueryClient();

  return useMutation<HelpQuery, Error, SubmitQueryRequest>({
    mutationFn: (data) => helpService.submitQuery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help", "my-queries"] });
    },
  });
};

export const useMyQueries = () => {
  return useQuery<HelpQuery[]>({
    queryKey: ["help", "my-queries"],
    queryFn: () => helpService.getMyQueries(),
  });
};

export const useAllQueries = (status?: string) => {
  return useQuery<HelpQuery[]>({
    queryKey: ["help", "all-queries", status],
    queryFn: () => helpService.getAllQueries(status),
  });
};

export const useReplyToQuery = () => {
  const queryClient = useQueryClient();

  return useMutation<HelpQuery, Error, ReplyQueryRequest>({
    mutationFn: (data) => helpService.replyToQuery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help", "all-queries"] });
    },
  });
};

export const useUpdateQueryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<HelpQuery, Error, { queryId: string; status: string }>({
    mutationFn: ({ queryId, status }) => helpService.updateQueryStatus(queryId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help", "all-queries"] });
    },
  });
};

