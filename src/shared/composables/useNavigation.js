import { computed } from "vue";
import { useProjectProfileStore } from "@/stores/projectProfile.store";

export function useNavigation() {

  const profile = useProjectProfileStore();

  const publicNavigation = computed(() =>
    profile.navigation.public ?? []
  );

  return {
    publicNavigation,
  };

}