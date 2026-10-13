/* Linux/glibc diagnostic only. Never linked into the IDE or worker runtime. */
#include <node_api.h>
#include <malloc.h>
#include <stdio.h>
#include <stdlib.h>

static napi_value trim(napi_env env, napi_callback_info info) {
  (void)info;
  napi_value value;
  if (napi_create_int32(env, malloc_trim(0), &value) != napi_ok) return NULL;
  return value;
}

static napi_value allocator_info(napi_env env, napi_callback_info info) {
  (void)info;
  char *text = NULL;
  size_t size = 0;
  FILE *stream = open_memstream(&text, &size);
  if (!stream) { napi_throw_error(env, NULL, "Cannot open allocator diagnostic stream."); return NULL; }
  int status = malloc_info(0, stream);
  if (fclose(stream) != 0) status = -1;
  if (status != 0) { free(text); napi_throw_error(env, NULL, "Cannot read allocator diagnostics."); return NULL; }
  napi_value value;
  napi_status result = napi_create_string_utf8(env, text, size, &value);
  free(text);
  return result == napi_ok ? value : NULL;
}

NAPI_MODULE_INIT() {
  napi_value function;
  if (napi_create_function(env, "trim", NAPI_AUTO_LENGTH, trim, NULL, &function) != napi_ok) return NULL;
  if (napi_set_named_property(env, exports, "trim", function) != napi_ok) return NULL;
  if (napi_create_function(env, "info", NAPI_AUTO_LENGTH, allocator_info, NULL, &function) != napi_ok) return NULL;
  if (napi_set_named_property(env, exports, "info", function) != napi_ok) return NULL;
  return exports;
}
