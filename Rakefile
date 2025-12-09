
# Default task - show available tasks
task :default do
  sh "rake --tasks"
end


desc "Clean TypeScript build artifacts"
task :clean_ts do
  Dir.chdir("ts-project") do
    sh "npx tsc -b --clean"
  end
end

file "ts-project/node_modules" do 
  Dir.chdir("ts-project") do
    sh "npm install"
  end
end

desc "Install TS npm dependencies"
task :install_ts => "ts-project/node_modules"


desc "Build TypeScript code with clean build"
task :build_ts => [:install_ts] do
  Dir.chdir("ts-project") do
    sh "npx tsc -b"
  end
end

desc "Generate TypeScript and ReScript modules"
task :generate, [:modules, :packages] do |t, args|
  modules = args[:modules] || 1000
  packages = args[:packages] || 10
  puts "Generating #{modules} modules across #{packages} packages"
  sh "node generate.js #{modules} #{packages}"
end

desc "Clean ReScript build artifacts"
task :clean_res do
  Dir.chdir("rescript-project") do
    sh "npx rescript clean"
  end
end

file "rescript-project/node_modules" do 
  Dir.chdir("rescript-project") do
    sh "npm install"
  end
end

desc "Install ReScript npm dependencies"
task :install_res => "rescript-project/node_modules"

desc "Build ReScript code with clean build"
task :build_res => [:install_res] do
  Dir.chdir("rescript-project") do
    puts "=== ReScript clean build ==="
    sh "time npx rescript build"
  end
end

task :clean do 
  sh "rm -rf rescript-project/lib"
  sh "rm -rf ts-project/dist"
  sh "rm -rf **/src"
  sh "rm -rf **/node_modules"
  sh "rm -rf ts-project/.tsbuildinfo"
end

task :reset => [:clean, :generate]

desc "Run comprehensive benchmark: multiple module/package configurations"
task :benchmark do
  configs = [
    { modules: 1000, packages: 10 },
    { modules: 2000, packages: 10 },
    { modules: 5000, packages: 10 },
  ]
  
  # Clean once at the beginning
  puts "Cleaning workspace..."
  Rake::Task[:clean].execute
  
  all_results = []
  
  configs.each_with_index do |config, config_idx|
    puts "\n" + "="*80
    puts "BENCHMARK CONFIG #{config_idx + 1}/#{configs.length}: #{config[:modules]} modules, #{config[:packages]} packages"
    puts "="*80
    
    # Only clean src directories and regenerate (preserve node_modules)
    sh "rm -rf ts-project/src rescript-project/src"
    sh "rm -rf ts-project/dist rescript-project/lib"
    sh "rm -rf ts-project/.tsbuildinfo"
    sh "node generate.js #{config[:modules]} #{config[:packages]}"
    
    # Install dependencies only for first config
    if config_idx == 0
      puts "\nInstalling dependencies..."
      Rake::Task[:install_ts].invoke
      Rake::Task[:install_res].invoke
    end
    
    ts_times = []
    res_times = []
    
    3.times do |trial|
      puts "\n--- TRIAL #{trial + 1} ---"
      
      # TypeScript trial
      puts "\nTypeScript Trial #{trial + 1}:"
      Dir.chdir("ts-project") do
        sh "npx tsc -b --clean > /dev/null 2>&1"
        start_time = Time.now
        sh "npx tsc -b > /dev/null 2>&1"
        end_time = Time.now
        ts_time = end_time - start_time
        ts_times << ts_time
        puts "  Time: #{ts_time.round(3)}s"
      end
      
      # ReScript trial
      puts "\nReScript Trial #{trial + 1}:"
      Dir.chdir("rescript-project") do
        sh "npx rescript clean > /dev/null 2>&1"
        start_time = Time.now
        sh "npx rescript build > /dev/null 2>&1"
        end_time = Time.now
        res_time = end_time - start_time
        res_times << res_time
        puts "  Time: #{res_time.round(3)}s"
      end
    end
    
    # Calculate averages
    ts_avg = ts_times.sum / ts_times.length
    res_avg = res_times.sum / res_times.length
    ratio = ts_avg < res_avg ? res_avg / ts_avg : ts_avg / res_avg
    winner = ts_avg < res_avg ? "TypeScript" : "ReScript"
    
    puts "\n" + "-"*60
    puts "RESULTS: #{config[:modules]} modules, #{config[:packages]} packages"
    puts "-"*60
    puts "TypeScript: #{ts_avg.round(3)}s average"
    puts "ReScript:   #{res_avg.round(3)}s average"
    puts "#{winner} is #{ratio.round(2)}x faster"
    
    all_results << {
      config: config,
      ts_avg: ts_avg,
      res_avg: res_avg,
      ratio: ratio,
      winner: winner
    }
  end
  
  # Summary table
  puts "\n" + "="*80
  puts "COMPREHENSIVE BENCHMARK SUMMARY"
  puts "="*80
  printf "%-20s | %-12s | %-12s | %-15s\n", "Configuration", "TypeScript", "ReScript", "Performance"
  puts "-" * 80
  all_results.each do |result|
    config_str = "#{result[:config][:modules]}m/#{result[:config][:packages]}p"
    ts_str = "#{result[:ts_avg].round(3)}s"
    res_str = "#{result[:res_avg].round(3)}s"
    perf_str = "#{result[:winner][0..2]} #{result[:ratio].round(2)}x"
    printf "%-20s | %-12s | %-12s | %-15s\n", config_str, ts_str, res_str, perf_str
  end
  puts "="*80
  
  puts "\nBenchmark complete. Cleaning up..."
  Rake::Task[:clean].reenable
  Rake::Task[:clean].execute
end

