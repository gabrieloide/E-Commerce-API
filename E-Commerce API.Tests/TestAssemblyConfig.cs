using Xunit;

// Disable parallel test execution so that in-memory database state remains predictable across fixtures
[assembly: CollectionBehavior(DisableTestParallelization = true)]
