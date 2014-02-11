#!/usr/bin/env ruby-local-exec

Dir['orig/**/*.jpg'].each do |orig_path|
  path = orig_path.gsub('orig/', '')
  path_2x = path.gsub('.jpg', '@2x.jpg')
  puts "#{orig_path} -> #{path},#{path_2x}"
  system "convert #{orig_path} -compress LosslessJPEG -resize 1500x #{path}"
  system "convert #{orig_path} -compress LosslessJPEG -resize 3000x #{path_2x}"
end
