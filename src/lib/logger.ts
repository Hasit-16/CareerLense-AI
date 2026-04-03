export function logStep(step: string, data: any) {
  console.log(`\n========== ${step} ==========`);

  if (typeof data === "string") {
    console.log(data);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }

  console.log("====================================\n");
}
