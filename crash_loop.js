console.log("💥 INTENTIONAL CRASH FOR RESTART 💥");
setTimeout(() => {
    process.exit(1);
}, 1000);
