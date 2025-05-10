#!/bin/bash

runs_on_each_supabase_functions() {
  local command=$1
  local exclude_functions=${{ env.EXCLUDE_FUNCTIONS }}
  for function_name in $(ls supabase/functions); do
    if [[ ! " ${exclude_functions[@]} " =~ " ${function_name} " ]]; then
      $command -c supabase/functions/${function_name}/deno.json
    fi
  done
}
